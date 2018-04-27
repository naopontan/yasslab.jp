describe('github_statistics.js', function() {
  describe('10 repositories each have 100 stars', function () {
    var mock_http_result = {
      target: {
        responseText: "",
        status: 200
      }
    };

    before(function () {
      var prepare = [];
      for (var i = 0; i < 10; i++) {
        var repository_data = {
          id: i,
          stargazers_count: 100
        };
        prepare.push(repository_data);
      }
      mock_http_result.target.responseText = JSON.stringify(prepare);
    });

    describe('#calcGitHubStatistics', function() {
      it('should return 10 repositories', function() {
        var result = calcGithubStatistics(mock_http_result);
        if (result.repositories === 10) {
        } else {
          throw new Error('repository count is not correct');
        }
      });

      it('should return 1000 stars', function() {
        var result = calcGithubStatistics(mock_http_result);
        if (result.stars === 1000) {
        } else {
          throw new Error('total star count is not correct');
        }
      });
    });

    describe('#githubSuccessCallback', function() {
      it('should return true when status is 200', function() {
        var is_succeed = githubSuccessCallback(mock_http_result);
        if (is_succeed == false) {
          throw new Error("success call back should return true but return "+is_succeed);
        }
      });

      it('should return false data when status is not 200', function() {
        mock_http_result.target.status = 404;
        var is_succeed = githubSuccessCallback(mock_http_result);
        if (is_succeed == true) {
          throw new Error("success call back should return false but return "+is_succeed);
        }
      });
    });

    describe('#githubErrorCallback', function() {
      it('should retry when retry_count < MAX_RETRY', function() {
        retry_count = 0;
        var is_retried = githubErrorCallback(mock_http_result);
        console.log("is retried = "+is_retried);
        if (is_retried == false) {
          throw new Error("error call back should return true but return "+is_retried);
        }
      });

      it('should not retry when retry_count >= MAX_RETRY', function() {
        retry_count = MAX_RETRY;
        var is_retried = githubErrorCallback(mock_http_result);
        if (is_retried == true) {
          throw new Error("error call back should return false but return "+is_retried);
        }
      });
    });

    describe('#modifyDom', function() {
      var stats;
      beforeEach(function () {
        var new_repositories_element = document.createElement("p");
        new_repositories_element.setAttribute("id", "github__repositories");
        new_repositories_element.setAttribute("style", "display:none;");
        document.body.appendChild(new_repositories_element);

        var new_stars_element = document.createElement("p");
        new_stars_element.setAttribute("id", "github__stars");
        new_stars_element.setAttribute("style", "display:none;");
        document.body.appendChild(new_stars_element);

        stats = calcGithubStatistics(mock_http_result);
      });

      afterEach(function () {
        var repositories = document.getElementById("github__repositories");
        var stars = document.getElementById("github__stars");
        repositories.parentNode.removeChild(repositories);
        stars.parentNode.removeChild(stars);
      });

      describe('when github return status 200', function() {
        it('should show correct stars count as 1000', function() {
          modifyDom(stats);
          var stars = document.getElementById("github__stars").innerText;
          if (stars !== "1000") {
            throw new Error('total star count should be correct count but show '+stars);
          }
        });

        it('should show correct repository count as 10', function() {
          modifyDom(stats);
          var repositories = document.getElementById("github__repositories").innerText;
          if (repositories !== "10") {
            throw new Error('total repository count should be correct count but show '+repositories);
          }
        });
      });
      describe('when github continue to return status without 200 over MAX_RETRY', function() {
        it('should show error stars like 🙇 ', function() {
          modifyDom(error_stats);
          var stars = document.getElementById("github__stars").innerText;
          if (stars !== "🙇") {
            throw new Error('total star count should not be count');
          }
        });

        it('should show error repositories like 🙏 ', function() {
          modifyDom(error_stats);
          var repositories = document.getElementById("github__repositories").innerText;
          if (repositories !== "🙏") {
            throw new Error('total repository count should not be count');
          }
        });
      });
    });
  });
});
